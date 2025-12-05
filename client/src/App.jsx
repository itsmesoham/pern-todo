import { Fragment, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// components
import InputTodo from "./components/InputTodo";
import ListTodos from "./components/ListTodos";
import Login from "./components/Login";
import PageLayout from "./components/PageLayout";

// pages
import Users from "./pages/Users";
import Permissions from "./pages/Permissions";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) setUser(data);
      } catch (err) {
        console.log("User not logged in");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Checking authentication...</h2>
      </div>
    );
  }

  return (
    <Routes>

      {/* Home Page */}
      <Route
        path="/"
        element={
          !user ? (
            <Login setUser={setUser} />
          ) : (
            <PageLayout user={user} handleLogout={handleLogout}>
              <InputTodo user={user} />
              <ListTodos user={user} />
            </PageLayout>
          )
        }
      />

      {/* Users Page */}
      <Route
        path="/users"
        element={
          !user ? (
            <Login setUser={setUser} />
          ) : (
            <PageLayout user={user} handleLogout={handleLogout} title="Users List">
              <Users user={user} />
            </PageLayout>
          )
        }
      />

      <Route
        path="/permissions"
        element={
          !user ? (
            <Login setUser={setUser} />
          ) : (
            <PageLayout user={user} handleLogout={handleLogout} title="Permissions List">
              {/* <Users user={user} /> */}
            </PageLayout>
          )
        }
      />

      {/* 404 Page */}
      <Route
        path="*"
        element={
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>404 - Page Not Found</h1>
            <p>The URL you entered does not exist.</p>
          </div>
        }
      />
    </Routes>
  );
}

export default App;