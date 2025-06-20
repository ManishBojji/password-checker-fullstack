import { useState } from "react";
import axios from "axios";
import sha1 from "js-sha1";

const PasswordChecker = () => {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [breached, setBreached] = useState(null);

  const common = ["123456", "password", "12345678", "qwerty", "admin", "letmein"];

  const calculateStrength = (pwd) => {
    if (common.includes(pwd.toLowerCase())) return "Very Weak";

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return levels[score];
  };

  const checkBreach = async () => {
    const hash = sha1(password).toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    try {
      const response = await axios.get(`http://localhost:5000/api/breach/${prefix}`);
      const lines = response.data.split("\r\n");
      const found = lines.find((line) => line.startsWith(suffix));
      setBreached(
        found ? `⚠️ Breached ${found.split(":")[1]} times` : "✅ Not found in breaches"
      );
    } catch (error) {
      setBreached("❌ Error checking breach.");
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setStrength(calculateStrength(val));
    setBreached(null);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">🔐 Password Analyzer</h1>
      <input
        type="password"
        value={password}
        onChange={handleChange}
        placeholder="Enter password"
        className="w-full p-2 mb-4 rounded text-black"
      />
      <div><strong>Strength:</strong> {strength}</div>
      <button
        onClick={checkBreach}
        className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
      >
        Check Breach
      </button>
      {breached && <div className="mt-4">{breached}</div>}
    </div>
  );
};

export default PasswordChecker;
