import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LeadList from "./LeadList";
import { useAuth } from "../context/AuthContext";
import {
  createLeadNote,
  deleteLeadNote,
  fetchLeadNotes,
  updateLeadNote,
} from "../api/client";

jest.mock("gsap", () => ({
  __esModule: true,
  default: {
    fromTo: jest.fn(),
  },
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../api/client", () => ({
  createLeadNote: jest.fn(),
  deleteLeadNote: jest.fn(),
  fetchLeadNotes: jest.fn(),
  updateLeadNote: jest.fn(),
}));

const lead = {
  id: 1,
  name: "Alice Example",
  email: "alice@example.com",
  company: "Example Co",
  dealValue: 50000,
  status: "PROSPECT",
};

function renderLeadList(overrides = {}) {
  return render(
    <LeadList
      leads={[lead]}
      search=""
      setSearch={jest.fn()}
      filterStatus="ALL"
      setFilterStatus={jest.fn()}
      onRequestAuth={jest.fn()}
      onToast={jest.fn()}
      onOpenAddLead={jest.fn()}
      {...overrides}
    />
  );
}

describe("LeadList notes", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { id: 9, userId: 9, email: "owner@example.com" },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("adds a note, refreshes notes, and shows a success toast", async () => {
    const onToast = jest.fn();
    fetchLeadNotes
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 101,
          content: "Fresh note",
          createdAt: "2026-04-26T12:00:00.000Z",
          createdBy: { id: 9, email: "owner@example.com" },
        },
      ]);
    createLeadNote.mockResolvedValue({
      id: 101,
      content: "Fresh note",
      createdAt: "2026-04-26T12:00:00.000Z",
      createdBy: { id: 9, email: "owner@example.com" },
    });

    renderLeadList({ onToast });

    fireEvent.click(screen.getByRole("button", { name: /notes \(0\)/i }));

    await waitFor(() => expect(fetchLeadNotes).toHaveBeenCalledWith(1));

    fireEvent.change(screen.getByPlaceholderText("Add a note..."), {
      target: { value: " Fresh note " },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    await waitFor(() =>
      expect(createLeadNote).toHaveBeenCalledWith(1, { content: "Fresh note" })
    );
    await waitFor(() => expect(fetchLeadNotes).toHaveBeenCalledTimes(2));

    expect(await screen.findByText("Fresh note")).toBeInTheDocument();
    expect(onToast).toHaveBeenCalledWith("Note added successfully!", "success");
  });

  test("shows creator-only controls and refreshes notes after edit and delete", async () => {
    const onToast = jest.fn();
    fetchLeadNotes
      .mockResolvedValueOnce([
        {
          id: 201,
          content: "Original note",
          createdAt: "2026-04-26T12:00:00.000Z",
          createdBy: { id: 9, email: "owner@example.com" },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 201,
          content: "Updated note",
          createdAt: "2026-04-26T12:00:00.000Z",
          createdBy: { id: 9, email: "owner@example.com" },
        },
      ])
      .mockResolvedValueOnce([]);
    updateLeadNote.mockResolvedValue({
      id: 201,
      content: "Updated note",
      createdAt: "2026-04-26T12:00:00.000Z",
      createdBy: { id: 9, email: "owner@example.com" },
    });
    deleteLeadNote.mockResolvedValue(null);

    renderLeadList({ onToast });

    fireEvent.click(screen.getByRole("button", { name: /notes \(0\)/i }));

    expect(await screen.findByText("Original note")).toBeInTheDocument();
    expect(screen.getByTitle("Edit note")).toBeInTheDocument();
    expect(screen.getByTitle("Delete note")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Edit note"));
    fireEvent.change(screen.getByDisplayValue("Original note"), {
      target: { value: "Updated note" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(updateLeadNote).toHaveBeenCalledWith(201, { content: "Updated note" })
    );
    expect(await screen.findByText("Updated note")).toBeInTheDocument();
    expect(onToast).toHaveBeenCalledWith("Note updated successfully!", "success");

    fireEvent.click(screen.getByTitle("Delete note"));

    await waitFor(() => expect(deleteLeadNote).toHaveBeenCalledWith(201));
    await waitFor(() =>
      expect(screen.getByText("No activity yet - start by adding a note")).toBeInTheDocument()
    );
    expect(onToast).toHaveBeenCalledWith("Note deleted successfully!", "success");
  });
});
