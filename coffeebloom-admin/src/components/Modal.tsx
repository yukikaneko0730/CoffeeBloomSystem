// src/components/Modal.tsx
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
};

export default function Modal({ isOpen, onClose, onSubmit }: ModalProps) {
  if (!isOpen) return null;

  let inputValue = "";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">➕ Add New Task</h2>
        <input
          type="text"
          placeholder="Task title"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          onChange={(e) => (inputValue = e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg border"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 text-white"
            onClick={() => {
              if (inputValue.trim()) {
                onSubmit(inputValue);
                onClose();
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
