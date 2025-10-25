import axios from "axios";
const Books = async() => {
    try {
        const response = await axios.get("https://bookapp-sfk5.onrender.com/api/books");
        return response.data;
    } catch (error) {
        console.log("Hata:",error)
    }
}

const LoginTime = async(username,password) => {
    try {
        const response = await axios.post("https://bookapp-sfk5.onrender.com/api/login",{
            username,
            password
        })
        return response.data;
    } catch (error) {
        console.log("Hata:",error)
    }
}

const Register = async (username, email, password, googleUser = null) => {
  try {
    const payload = googleUser
      ? { googleUser }
      : { username, email, password };

    const response = await axios.post("https://bookapp-sfk5.onrender.com/api/register", payload);
    console.log("Register Response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data[1]?.error || "Bilinmeyen bir hata oluştu.";
      return (errorMessage);
    } else {
      console.error("Register Error:", error.message);
    }
  }
};


const TakeBookText = async(bookId) => {
    try {
        const response = await axios.post("https://bookapp-sfk5.onrender.com/api/getBookText",{
            bookId
        })
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

const ConvertPdfToText = async (pdf) => {
    const formData = new FormData();
    formData.append('file', {
      uri: pdf.uri,
      type: 'application/pdf',
      name: 'document.pdf',
    });

    try {
      const response = await axios.post("https://bookapp-sfk5.onrender.com/api/extract-pdf", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('PDF gönderim hatası:', error);
      return null;
    }
};

const ConvertEpubToText = async (epub) => {
    const formData = new FormData();
    formData.append('file', {
      uri: epub.uri,
      type: 'application/epub+zip',
      name: 'document.epub',
    });

    try {
      const response = await axios.post("https://bookapp-sfk5.onrender.com/api/extract-epub", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('PDF gönderim hatası:', error);
      return null;
    }
  };




const ChangePassword = async(userId,oldPassword,newPassword) => {
    try {
        const response = await axios.post("https://bookapp-sfk5.onrender.com/api/changepass",{
            userId,
            oldPassword,
            newPassword
        })
        return response.data;
    } catch (error) {
        console.error(error)
    }
}

const ForgotYourPass = async(userId,userEmail) => {
    try {
        const response = await axios.post("https://bookapp-sfk5.onrender.com/api/forgotpass",{
            userEmail,
            userId
        })
        return response.data;
    } catch (error) {
        console.error(error)
    }
}

const ResetPassword = async(userId,userEmail,newPassword,resetCode) => {
    try {
        const response = await axios.post("https://bookapp-sfk5.onrender.com/api/reset-password",{
            userId,
            userEmail,
            newPassword,
            resetCode
        })
        return response.data;
    } catch (error) {
        console.error(error)
    }
}

const DeleteAccount = async(username) => {
  try {
    const response = await axios.post("https://bookapp-sfk5.onrender.com/api/delete-account",{
      username
    })
    return response.data;
  } catch (error) {
    console.error(error)
  }
}
export{
    Books,
    LoginTime,
    Register,
    TakeBookText,
    ConvertPdfToText,
    ChangePassword,
    ForgotYourPass,
    ResetPassword,
    ConvertEpubToText,
    DeleteAccount
};
