import { Fragment, useState } from "react";
import "./App.css";

// components
import InputTodo from "./components/InputTodo";
import ListTodos from "./components/ListTodos";
import Login from "./components/Login"; // add this

function App() {
  // state to store logged-in user info
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  // logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Fragment>
      <div className="container">
        {!user ? (
          // if no user is logged in, show login/register
          <Login setUser={setUser} />
        ) : (
          // once logged in, show the todo app
          <>{/* once logged in, show the todo app */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Welcome, {user.username}</h2>
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
            {/* pass user to InputTodo and ListTodos */}
            <InputTodo user={user} />
            <ListTodos user={user} />
          </>
        )}
      </div>
    </Fragment>
  );
}

export default App;
