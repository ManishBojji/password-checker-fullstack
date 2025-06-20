import React, { useState } from "react";
import sha1 from "js-sha1";
import axios from "axios";

const PasswordChecker = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState("");
  const [breachCount, setBreachCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const evaluateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 0:
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Fair";
      case 4:
        return pwd.length >= 12 ? "Strong" : "Good";
      default:
        return "";
    }
  };

  const getSuggestions = (pwd) => {
    const suggestions = [];
    if (pwd.length < 8) suggestions.push("Make password at least 8 characters");
    if (!/[A-Z]/.test(pwd)) suggestions.push("Add uppercase letters");
    if (!/[0-9]/.test(pwd)) suggestions.push("Add numbers");
    if (!/[^A-Za-z0-9]/.test(pwd)) suggestions.push("Add special characters");

    const commonPasswords = [
      "123456", "password", "12345678", "qwerty", "abc123", "111111",
    ];
    if (commonPasswords.includes(pwd.toLowerCase()))
      suggestions.push("Avoid common passwords");

    return suggestions;
  };

  const handleChange = async (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setStrength(evaluateStrength(pwd));
    setBreachCount(null);
    setError(null);

    if (pwd.length === 0) {
      setStrength("");
      return;
    }

    if (pwd.length >= 6) {
      setLoading(true);
      try {
        const hash = sha1(pwd).toUpperCase();
        const prefix = hash.slice(0, 5);
        const suffix = hash.slice(5);

        const res = await axios.get(`http://localhost:5000/api/breach/${prefix}`);
        const hashes = res.data.trim().split("\r\n");
        const found = hashes.find((h) => h.split(":")[0] === suffix);

        setBreachCount(found ? parseInt(found.split(":")[1], 10) : 0);
      } catch (err) {
        setError("Error checking breach status");
      } finally {
        setLoading(false);
      }
    }
  };

  const suggestions = getSuggestions(password);

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Main content card */}
      <div className="relative max-w-md w-full p-6 rounded shadow-lg bg-gray-900 bg-opacity-90 text-white">
        <h2 className="text-2xl font-bold mb-4 animate-pulse">
          Password Strength & Breach Checker
        </h2>

        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handleChange}
          placeholder="Enter password"
          className="w-full p-3 mb-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <button
          onClick={toggleShowPassword}
          className="mb-4 text-sm text-blue-400 hover:underline hover:scale-110 transform transition-transform duration-300"
        >
          {showPassword ? "Hide Password" : "Show Password"}
        </button>

        {/* Strength meter with smooth width/color transition */}
        <div className="w-full bg-gray-700 rounded h-3 mb-3 transition-all duration-500 ease-in-out">
          <div
            className={`h-3 rounded transition-all duration-500 ease-in-out ${
              strength === "Very Weak"
                ? "w-1/4 bg-red-600"
                : strength === "Weak"
                ? "w-2/4 bg-orange-500"
                : strength === "Fair"
                ? "w-3/4 bg-yellow-400"
                : strength === "Good"
                ? "w-4/4 bg-green-400"
                : strength === "Strong"
                ? "w-full bg-green-600"
                : "w-0"
            }`}
          ></div>
        </div>

        {strength && (
          <p className="mb-2 font-semibold transition-colors duration-500 ease-in-out">
            Strength:{" "}
            <span
              className={
                strength === "Very Weak"
                  ? "text-red-600"
                  : strength === "Weak"
                  ? "text-orange-500"
                  : strength === "Fair"
                  ? "text-yellow-400"
                  : "text-green-400"
              }
            >
              {strength}
            </span>
          </p>
        )}

        {suggestions.length > 0 && (
          <ul className="text-sm text-red-400 mb-4 list-disc list-inside transition-opacity duration-700 ease-in-out opacity-100">
            {suggestions.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        )}

        {loading && <p className="animate-pulse">Checking breach status...</p>}

        {!loading && breachCount !== null && (
          <p
            className={`font-semibold transition-colors duration-700 ease-in-out ${
              breachCount > 0 ? "text-red-600 animate-pulse" : "text-green-400"
            }`}
          >
            {breachCount > 0
              ? `This password has appeared in ${breachCount.toLocaleString()} breaches!`
              : "No breaches found for this password."}
          </p>
        )}

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default PasswordChecker;
