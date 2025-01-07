import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button } from "./components/Button";
import { PlusIcon } from "./icons/PlusIcon";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Button
        variant="primary"
        size="md"
        text="Click this"
        onClick={() => setCount(count + 1)}
        startIcon={<PlusIcon size="md" />}
      />
    </>
  );
}

export default App;
