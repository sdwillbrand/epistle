import { Editor } from "./components/Editor";
import { createStore, Provider } from "jotai";

export const editorStore = createStore();

function App() {
  return (
    <div id="App" className="px-10 py-5">
      <Provider store={editorStore}>
        <Editor />
      </Provider>
    </div>
  );
}

export default App;
