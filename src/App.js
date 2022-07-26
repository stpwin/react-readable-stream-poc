import { useEffect, useState } from 'react';

function App() {
  const [chunks, setChunks] = useState([]);

  const fff = async () => {
    fetch(`${process.env.REACT_APP_API_URL}/stream`)
      .then(async (response) => {
        // response.body is a ReadableStream
        const reader = response.body.getReader();
        const textDecoder = new TextDecoder()
        for await (const chunk of readChunks(reader)) {
          const result = textDecoder.decode(chunk);
          console.log(`received chunk of size ${chunk.length}`, result);
          setChunks((prev) => [...prev, result]);
        }
      });

    // readChunks() reads from the provided reader and yields the results into an async iterable
    function readChunks(reader) {
      return {
        async*[Symbol.asyncIterator]() {
          let readResult = await reader.read();
          while (!readResult.done) {
            yield readResult.value;
            readResult = await reader.read();
          }
        },
      };
    }
  }

  const handleStart = () => {
    setChunks([])
    fetch(`${process.env.REACT_APP_API_URL}/start`)
    fff()
  }

  const handleReset = () => {
    setChunks([])
    fetch(`${process.env.REACT_APP_API_URL}/reset`)
  }

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/initial`).then(async (response) => {
      const processes = await response.json()
      setChunks(processes)
    })
    fff()
    return () => { }
  }, [])

  return (
    <div>
      <button onClick={handleStart}>start</button>
      <button onClick={handleReset}>reset</button>
      {chunks.map((chunk, index) => {
        return <div key={index}>{chunk}</div>
      })
      }
    </div>
  );
}

export default App;
