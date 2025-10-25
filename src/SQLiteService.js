import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = "MyDatabase.db";
const database_version = "1.0";
const database_displayname = "SQLite Test Database";
const database_size = 200000;

export const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabase(
      database_name,
      database_version,
      database_displayname,
      database_size
    );
    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};


export const createTables = async (db) => {
  try {
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        level TEXT,
        text TEXT,
        isServer INTEGER DEFAULT 0
      );`
    );
  } catch (error) {
    console.error("Failed to create tables:", error);
    throw error;
  }
};

export const insertBook = async (db, title, author, level, text, isServer = 0) => {
  try {
    const result = await db.executeSql(
      `INSERT INTO books (title, author, level, text, isServer) VALUES (?, ?, ?, ?, ?);`,
      [title, author, level, text, isServer]
    );
    return result;
  } catch (error) {
    console.error("Error adding book:", error);
    throw error;
  }
};

export const getBooks = async (db) => {
  try {
    const [results] = await db.executeSql(`SELECT * FROM books;`);
    return results.rows.raw();
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

export const getServerBooks = async (db) => {
  try {
    const [results] = await db.executeSql(`SELECT * FROM books WHERE isServer = 1;`);
    return results.rows.raw();
  } catch (error) {
    console.error("Error fetching server books:", error);
    throw error;
  }
};

export const getUserBooks = async (db) => {
  try {
    const [results] = await db.executeSql(`SELECT * FROM books WHERE isServer = 0;`);
    return results.rows.raw();
  } catch (error) {
    console.error("Error fetching user books:", error);
    throw error;
  }
};

export const closeDatabase = async (db) => {
  if (!db) return;
  
  try {
    if (db._running) {
      console.warn('Waiting for ongoing transactions to complete...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await db.close();
  } catch (error) {
    if (error.message.includes('transaction is in progress')) {
      console.warn('Could not close database due to ongoing transaction. Will retry...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        await db.close();
      } catch (retryError) {
        console.error("Failed to close database after retry:", retryError);
        throw retryError;
      }
    } else {
      console.error("Error closing database:", error);
      throw error;
    }
  }
};

export const deleteBook = async (db, bookId) => {
  try {
    const result = await db.executeSql(
      'DELETE FROM books WHERE id = ?',
      [bookId]
    );
    return result;
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
};
export const getBookByTitle = async (db, title) => {
  try {
    const [results] = await db.executeSql(
      `SELECT * FROM books WHERE title = ?;`,
      [title]
    );
    if (results.rows.length > 0) {
      return results.rows.item(0);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching book by id:", error);
    throw error;
  }
};
export const isBookInDatabase = async (db, title) => {
  try {
    const [results] = await db.executeSql(
      'SELECT COUNT(*) AS count FROM books WHERE title = ?',
      [title]
    );
    return results.rows.item(0).count > 0;
  } catch (error) {
    console.error("Error checking book existence:", error);
    throw error;
  }
};

export const downloadBook = async (db, book,text) => {
  try {
    const isDownloaded = await isBookDownloaded(db, book.title);
    if (!isDownloaded) {
      await insertBook(db, book.title, book.author, book.level, text, 1);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error downloading book:", error);
    throw error;
  }
};

export const isBookDownloaded = async (db, title) => {
  try {
    const [results] = await db.executeSql(
      'SELECT COUNT(*) AS count FROM books WHERE title = ?',
      [title]
    );
    return results.rows.item(0).count > 0;
  } catch (error) {
    console.error("Error checking book download status:", error);
    throw error;
  }
};

export const dropTable = async (db) => {
  try {
    await db.executeSql(`DROP TABLE IF EXISTS books;`);
  } catch (error) {
    console.error('Failed to delete table:', error);
    throw error;
  }
};

export const checkAndCreateTable = async (db) => {
  try {
      const result = await db.executeSql(`SELECT name FROM sqlite_master WHERE type='table' AND name='books';`);
      if (result[0].rows.length === 0) {
          await createTables(db);
      }
  } catch (error) {
      console.error("Tablo kontrolü veya oluşturulması sırasında hata:", error);
      throw error;
  }
};
