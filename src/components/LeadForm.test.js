import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LeadForm from "./LeadForm";
import { useAuth } from "../context/AuthContext";

jest.mock("gsap", () => ({
  __esModule: true,
  default: {
    fromTo: jest.fn(),
  },
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("LeadForm", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("submits only the allowed trimmed payload fields", async () => {
    const onAdd = jest.fn().mockResolvedValue(true);
    useAuth.mockReturnValue({ isAuthenticated: true });

    render(<LeadForm onAdd={onAdd} onRequestAuth={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. Prachi Rajput"), {
      target: { value: "  Alice Example  " },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. prachi@example.com"), {
      target: { value: "  alice@example.com  " },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Sati College"), {
      target: { value: "  Example Co  " },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. 50000"), {
      target: { value: "50000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add lead/i }));

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({
        name: "Alice Example",
        email: "alice@example.com",
        company: "Example Co",
        dealValue: 50000,
        status: "PROSPECT",
      })
    );
  });

  test("opens register mode when an unauthenticated user tries to add a lead", () => {
    const onRequestAuth = jest.fn();
    useAuth.mockReturnValue({ isAuthenticated: false });

    render(<LeadForm onAdd={jest.fn()} onRequestAuth={onRequestAuth} />);

    fireEvent.click(screen.getByRole("button", { name: /sign up to add lead/i }));

    expect(onRequestAuth).toHaveBeenCalledWith("register");
  });
});
