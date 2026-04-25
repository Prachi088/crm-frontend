import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AuthModal from "./AuthModal";
import { loginUser, registerUser } from "../api/client";
import { useAuth } from "../context/AuthContext";

jest.mock("gsap", () => ({
  __esModule: true,
  default: {
    fromTo: jest.fn(),
    to: jest.fn((target, vars) => {
      vars?.onComplete?.();
      return {};
    }),
  },
}));

jest.mock("../api/client", () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("AuthModal", () => {
  const loginMock = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    useAuth.mockReturnValue({ login: loginMock });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test("register stores session and closes modal", async () => {
    const onClose = jest.fn();
    registerUser.mockResolvedValue({
      token: "token-123",
      userId: 42,
      email: "new@example.com",
    });

    render(<AuthModal onClose={onClose} initialMode="register" />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: " new@example.com " },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: " secret123 " },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    });

    await waitFor(() =>
      expect(registerUser).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "secret123",
      })
    );
    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith({
        token: "token-123",
        userId: 42,
        email: "new@example.com",
      })
    );
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  test("login clears stale backend errors on retry and stores session", async () => {
    const onClose = jest.fn();
    loginUser
      .mockRejectedValueOnce(new Error("Invalid email"))
      .mockResolvedValueOnce({
        token: "token-456",
        userId: 7,
        email: "fixed@example.com",
      });

    render(<AuthModal onClose={onClose} initialMode="login" />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret123" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    });

    await screen.findByText("Invalid email");

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "fixed@example.com" },
    });

    expect(screen.queryByText("Invalid email")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    });

    await waitFor(() =>
      expect(loginUser).toHaveBeenLastCalledWith({
        email: "fixed@example.com",
        password: "secret123",
      })
    );
    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith({
        token: "token-456",
        userId: 7,
        email: "fixed@example.com",
      })
    );
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
