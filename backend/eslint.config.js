import js from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    ...js.configs.recommended,
  },
];