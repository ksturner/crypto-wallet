export default function Button({ children }) {
    return (
        <button className="text-white m-2 p-2 rounded bg-blue-500 hover:bg-blue-600 transition">
            {children}
        </button>
    );
}
