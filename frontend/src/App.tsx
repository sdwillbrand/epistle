import { Editor } from "@/components/Editor";
import { createStore, Provider } from "jotai";
import { Button } from "./components/ui/button";
import { MenuIcon } from "lucide-react";
import { FileDrawer } from "./components/FileDrawer";
import { useState } from "react";

export const editorStore = createStore();

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div id="App" className="px-10 py-5">
      <Provider store={editorStore}>
        <Button onClick={() => setOpen((prev) => !prev)}>
          <MenuIcon />
        </Button>
        <FileDrawer open={open} />
        <Editor />
      </Provider>
    </div>
  );
}

export default App;
