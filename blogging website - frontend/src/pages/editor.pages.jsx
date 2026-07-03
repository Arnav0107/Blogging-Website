import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";

const Editor = () => {
  const [editorState, setEditorState] = useState("editor");
  const { userAuth } = useContext(UserContext) || {};
  const access_token = userAuth?.access_token;
  return access_token == null ? (
    <Navigate to="/signin" />
  ) : editorState == "editor" ? (
    <BlogEditor />
  ) : (
    <h1>Publish form</h1>
  );
};

export default Editor;
