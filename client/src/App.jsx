import { Fragment, useState, useEffect } from "react";
import "./App.css";

// components
import InputTodo from "./components/InputTodo";
import ListTodos from "./components/ListTodos";
import Login from "./components/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check logged-in user from JWT cookie when app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          method: "GET",
          credentials: "include", // Important: send cookies
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data); // backend returns user object
        }
      } catch (err) {
        console.log("User not logged in");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Logout
  const handleLogout = async () => {
    await fetch("http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <Fragment>
      <div className="container">
        {!user ? (
          <Login setUser={setUser} />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>Welcome, {user.username}</h2>

              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <InputTodo user={user} />
            <ListTodos user={user} />
          </>
        )}
      </div>
    </Fragment>
  );
}

export default App;