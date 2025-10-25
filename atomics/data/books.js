const fileurl = 'http://localhost:5000/api/books'
export const books = [
    {
      id: '1',
      title: 'War And Peace',
      author: 'Lev Tolstoy',
      description: 'A novel about the serious issues of rape and racial inequality.',
      category: 'Classic',
      level: 'C1',
      coverImage: './images.jpeg',
      fileUrl: `${fileurl}/books/to-kill-a-mockingbird.pdf`,
    },
    {
      id: '2',
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian social science fiction novel and cautionary tale.',
      category: 'Dystopian',
      level: 'C1',
      coverImage: './images.jpeg',
      fileUrl: `${fileurl}/books/1984.pdf`,
    },
  ];
