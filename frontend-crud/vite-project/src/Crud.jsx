
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;
import "./Crud.css";


function Crud() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
  const res = await fetch(`${API_URL}/notes`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setNotes(data.map(note => ({
            title: note.title,
            desc: note.content,
            date: new Date(note.createdAt || note.updatedAt || Date.now()).toLocaleString(),
            _id: note._id
          })));
        }
      } catch (err) {}
    };
    fetchNotes();
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || !desc.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      if (editIndex !== null) {
        const noteToEdit = notes[editIndex];
  const res = await fetch(`${API_URL}/notes/${noteToEdit._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ title, content: desc })
        });
        if (res.ok) {
          const updatedNote = await res.json();
          const updated = [...notes];
          updated[editIndex] = {
            title: updatedNote.title,
            desc: updatedNote.content,
            date: new Date(updatedNote.updatedAt || Date.now()).toLocaleString(),
            _id: updatedNote._id
          };
          setNotes(updated);
          setEditIndex(null);
          setSelectedIndex(editIndex);
          setNotification("Note updated successfully!");
        }
      } else {
  const res = await fetch(`${API_URL}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ title, content: desc })
        });
        if (res.ok) {
          const newNote = await res.json();
          setNotes([
            ...notes,
            {
              title: newNote.title,
              desc: newNote.content,
              date: new Date(newNote.createdAt || Date.now()).toLocaleString(),
              _id: newNote._id
            }
          ]);
          setSelectedIndex(notes.length);
          setNotification("Note added successfully!");
        }
      }
      setTitle("");
      setDesc("");
    } catch (err) {}
  };

  const handleEdit = (index) => {
    setTitle(notes[index].title);
    setDesc(notes[index].desc);
    setEditIndex(index);
    setSelectedIndex(index);
  };

  const handleDelete = async (index) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const noteToDelete = notes[index];
    try {
  const res = await fetch(`${API_URL}/notes/${noteToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const newNotes = notes.filter((_, i) => i !== index);
        setNotes(newNotes);
        if (selectedIndex === index) setSelectedIndex(null);
        setNotification("Note deleted successfully!");
      }
    } catch (err) {}
  };

  // Notification timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // UI
  return (
    <>
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#22c55e',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 18,
          zIndex: 9999,
          boxShadow: '0 2px 12px rgba(34,197,94,0.15)'
        }}>
          {notification}
        </div>
      )}
      <div className="notes-app-wrapper">
        <aside className="notes-sidebar">
          <div className="notes-sidebar-title">Your Notes</div>
          <div className="notes-list-titles" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {notes.length === 0 && <div style={{padding: '0 18px', color: '#64748b'}}>No notes yet.</div>}
            {notes.map((note, idx) => (
              <button
                key={note._id || idx}
                className={`note-title-item${selectedIndex === idx ? ' selected' : ''}`}
                onClick={() => setSelectedIndex(idx)}
                style={{ textAlign: 'left', width: '100%', borderBottom: '1px solid #e5e7eb', borderRadius: 0, margin: 0, padding: '14px 18px', fontSize: 16 }}
              >
                {note.title || 'Untitled'}
              </button>
            ))}
          </div>
        </aside>
        <main className="notes-main">
          <div className="notes-title">📝 Notes App</div>
          <div className="notes-form">
            <input
              type="text"
              placeholder="Note Heading"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <br />
            <textarea
              placeholder="Write your note here..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows="3"
            />
            <br />
            <button onClick={handleAdd}>
              {editIndex !== null ? "Update Note" : "Add Note"}
            </button>
          </div>
          {selectedIndex !== null && notes[selectedIndex] && (
            <div className="notes-detail">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>{notes[selectedIndex].title}</h3>
                <div className="note-actions" style={{ position: 'static', marginLeft: 8 }}>
                  <button onClick={() => handleEdit(selectedIndex)}>Edit</button>
                  <button onClick={() => handleDelete(selectedIndex)}>Delete</button>
                </div>
              </div>
              <p>{notes[selectedIndex].desc}</p>
              <small>🕒 {notes[selectedIndex].date}</small>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Crud;
