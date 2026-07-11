import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

function AuthHarness() {
  const { login, logout, acceptTerms, token, user, isAuthenticated } = useAuth();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
      login({
        token: "token-999",
        userId: 55,
        email: "owner@example.com",
        role: "MANAGER",
      })
        }
      >
        Login
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
      <button type="button" onClick={acceptTerms}>
        Accept Terms
      </button>
      <span>{token || "no-token"}</span>
      <span>{user?.email || "no-email"}</span>
      <span>{user?.termsAccepted ? "terms-accepted" : "terms-pending"}</span>
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
      role: "MANAGER",
      termsAccepted: false,
    });
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByText("terms-pending")).toBeInTheDocument();
    expect(screen.getByText("authenticated")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /accept terms/i }));

    expect(localStorage.getItem("crm-terms-accepted:55")).toBe("true");
    expect(JSON.parse(localStorage.getItem("crm-user"))).toMatchObject({
      id: 55,
      termsAccepted: true,
    });
    expect(screen.getByText("terms-accepted")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("crm-user")).toBeNull();
    expect(screen.getByText("no-token")).toBeInTheDocument();
    expect(screen.getByText("anonymous")).toBeInTheDocument();
  });
});
