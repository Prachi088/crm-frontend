import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

function AuthHarness() {
  const { login, logout, token, user, isAuthenticated } = useAuth();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          login({
            token: "token-999",
            userId: 55,
            email: "owner@example.com",
          })
        }
      >
        Login
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
      <span>{token || "no-token"}</span>
      <span>{user?.email || "no-email"}</span>
      <span>{isAuthenticated ? "authenticated" : "anonymous"}</span>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("stores normalized auth data and clears it on logout", () => {
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(localStorage.getItem("token")).toBe("token-999");
    expect(JSON.parse(localStorage.getItem("crm-user"))).toEqual({
      id: 55,
      userId: 55,
      email: "owner@example.com",
    });
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByText("authenticated")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("crm-user")).toBeNull();
    expect(screen.getByText("no-token")).toBeInTheDocument();
    expect(screen.getByText("anonymous")).toBeInTheDocument();
  });
});
