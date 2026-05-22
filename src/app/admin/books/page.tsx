"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, PlusCircle, Save } from "lucide-react";
import styles from "./page.module.css";

interface Category {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverImage: string;
  description: string;
  department: string;
  rackLocation: string;
  status: string;
  categoryId: string;
  category?: Category;
}

export default function BookInventory() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [rackLocation, setRackLocation] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [categoryId, setCategoryId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setIsbn("");
    setCoverImage("");
    setDescription("");
    setDepartment("Computer Science");
    setRackLocation("");
    setStatus("AVAILABLE");
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    setEditingBookId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBookId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn);
    setCoverImage(book.coverImage);
    setDescription(book.description);
    setDepartment(book.department);
    setRackLocation(book.rackLocation);
    setStatus(book.status);
    setCategoryId(book.categoryId);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !isbn || !rackLocation || !categoryId) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      title,
      author,
      isbn,
      coverImage: coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300",
      description,
      department,
      rackLocation,
      status,
      categoryId,
    };

    try {
      let res;
      if (editingBookId) {
        // Edit existing book
        res = await fetch(`/api/books/${editingBookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Add new book
        res = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save operation failed.");
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
      alert(editingBookId ? "Book updated successfully." : "Book added to catalog successfully.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving book.");
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to permanently delete this book from the catalog? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
        alert("Book deleted successfully.");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting book.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Book Catalog Inventory</h2>
          <p>Create, update, or remove digital and physical resources in the central catalog.</p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenAddModal}>
          <Plus size={18} /> Add New Book
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Retrieving inventory details...</div>
      ) : books.length === 0 ? (
        <div className={`${styles.emptyState} glass`}>
          <h3>No Books in Catalog</h3>
          <p>Click &apos;Add New Book&apos; above to register your first library resource.</p>
        </div>
      ) : (
        <div className="table-container glass animate-fade-in">
          <table className="modern-table">
            <thead>
              <tr>
                <th>ISBN</th>
                <th>Title</th>
                <th>Author</th>
                <th>Department</th>
                <th>Rack Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td className={styles.isbn}>{book.isbn}</td>
                  <td>
                    <div className={styles.bookCell}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className={styles.coverImage}
                      />
                      <span className={styles.bookTitle}>{book.title}</span>
                    </div>
                  </td>
                  <td>{book.author}</td>
                  <td>{book.department}</td>
                  <td>Rack {book.rackLocation}</td>
                  <td>
                    <span className={`badge ${
                      book.status === "AVAILABLE" ? "badge-success" : 
                      book.status === "BORROWED" ? "badge-warning" : "badge-error"
                    }`}>
                      {book.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionCol}>
                      <button 
                        className={styles.editRowBtn} 
                        onClick={() => handleOpenEditModal(book)}
                        title="Edit Book"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className={styles.deleteRowBtn} 
                        onClick={() => handleDelete(book.id)}
                        title="Delete Book"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Book Modal Form Dialog Overlay */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} glass animate-fade-in`}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <PlusCircle size={20} color="var(--primary)" />
                <h3>{editingBookId ? "Edit Catalog Item" : "Register Catalog Item"}</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="modal-title">Book Title *</label>
                  <input
                    id="modal-title"
                    type="text"
                    placeholder="e.g. Introduction to Algorithms"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="modal-author">Author Name *</label>
                  <input
                    id="modal-author"
                    type="text"
                    placeholder="e.g. Thomas H. Cormen"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="modal-isbn">ISBN Code *</label>
                  <input
                    id="modal-isbn"
                    type="text"
                    placeholder="e.g. 9780262033848"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="modal-cover">Cover Image URL</label>
                  <input
                    id="modal-cover"
                    type="url"
                    placeholder="e.g. https://domain.com/image.jpg"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="modal-dept">Department *</label>
                  <select 
                    id="modal-dept"
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Literature">Literature</option>
                    <option value="Science">Science</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="modal-rack">Rack Location *</label>
                  <input
                    id="modal-rack"
                    type="text"
                    placeholder="e.g. A-12 or CS-04"
                    value={rackLocation}
                    onChange={(e) => setRackLocation(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="modal-cat">Book Category *</label>
                  <select 
                    id="modal-cat"
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="modal-status">Status *</label>
                  <select 
                    id="modal-status"
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BORROWED">Borrowed</option>
                    <option value="RESERVED">Reserved</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroupFull}>
                <label htmlFor="modal-desc">Book Description</label>
                <textarea
                  id="modal-desc"
                  rows={3}
                  placeholder="Enter a brief summary of the book content and key topics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtnForm}><Save size={16} /> Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
