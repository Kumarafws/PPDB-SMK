/**
 * Dijalankan sekali sebelum suite test.
 * Pastikan NODE_ENV=test agar perilaku auth/logging konsisten jika ada.
 */
process.env.NODE_ENV = process.env.NODE_ENV ?? "test"
