const runEngine = async (FEN, depth) => {
    const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
  
    const bestMove = await new Promise((resolve) => {
      worker.addEventListener("message", (message) => {
        resolve(message.data);
      });
  
      worker.postMessage([FEN, depth]);
    });
  
    worker.terminate();
  
    return bestMove;
  };
  
  export default runEngine;
  