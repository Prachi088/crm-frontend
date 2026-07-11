import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserMenu from "./UserMenu";

jest.mock("gsap", () => ({
  fromTo: jest.fn(),
  to: jest.fn(),
}));

const mockLogout = jest.fn();

jest.mock("./context/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Ada Lovelace", email: "ada@example.com", role: "sales_rep" },
    logout: mockLogout,
    isAdmin: false,
  }),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    mockLogout.mockReset();
  });

  it("shows profile, settings, and logout actions in the dropdown", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button", { name: /account menu/i }));

    expect(screen.getByText("My Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });
});
