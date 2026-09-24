/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Основная палитра MAX
        max: {
          // Фоны
          bg: "#17181c", // тёмный фон (тема space)
          "bg-light": "#ffffff", // светлый фон
          "bg-secondary": "#f4f4f5", // фон сайдбара
          // Акценты
          primary: "#007aff", // синий (кнопки, ссылки)
          "primary-hover": "#0066d6",
          // Сообщения
          "bubble-out": "#007aff", // исходящее
          "bubble-in": "#ffffff", // входящее
          // Статусы
          read: "#5eb5f7", // прочитано (синие галочки)
          delivered: "#8e8e93", // доставлено (серые галочки)
          error: "#ff3b30",
          // Текст
          "text-primary": "#000000",
          "text-secondary": "#8e8e93",
          "text-inverse": "#ffffff",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        detail: ["14px", { lineHeight: "20px" }],
        "detail-lg": ["16px", { lineHeight: "22px" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      borderRadius: {
        bubble: "12px",
        card: "16px",
      },
    },
  },
  plugins: [],
};
