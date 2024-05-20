//skapar en login funktion som loggar in dig
let Login = async () => {
  let UserName = document.querySelector("#UserName").value;
  let Password = document.querySelector("#PassWord").value;

  //sätta en try för att få ut felmeddelande om de inte funkar
  try {
    let res = await axios.post("http://localhost:1337/api/auth/local", {
      identifier: UserName,
      password: Password,
    });
    //lägg token i sessions storage för framtida bruk
    //samt lägg user i storage för att få med den inloggade usern data till efter funktionen är slutförd
    sessionStorage.setItem("token", res.data.jwt);
    sessionStorage.setItem("user", JSON.stringify(res.data.user));
    //rensar input fälten när funktionen närmar sitt slut
    document.querySelector("#UserName").value = "";
    document.querySelector("#PassWord").value = "";
    RenderLoginState();
  } catch (error) {
    console.log(error.code);
    //kolla om de är ett bad request så vet vi att nåt postas men inte stämmer överens med nån användare
    if (error.code === "ERR_BAD_REQUEST") {
      alert("Incorrekt Användarnamn eller Lösenord");
      //annars är de ett annat fel jag inte fått upp genom att testa min application
    } else {
      alert("Unknow Error Check Connection");
    }
  }
};
//hämtar och kör färg temat funktionen
let GetColorTeam = async () => {
  try {
    let res = await axios.get("http://localhost:1337/api/color-team");
    let color = res.data.data.attributes.backgroundColor;
    let body = document.querySelector("body");
    body.style.background = `linear-gradient(rgb(0, 0, 0), ${color}, black`;
  } catch (error) {
    console.log(error);
  }
};
GetColorTeam();

//hämtar knappen och kör login funktionen på knappen med en eventlistener onclick
let LoginBtn = document
  .querySelector("#LoginBtn")
  .addEventListener("click", Login);

//Reg en användare funktion
let Register = async () => {
  let RegUserName = document.querySelector("#RegUserName").value;
  let RegEmail = document.querySelector("#RegEmail").value;
  let RegPassword = document.querySelector("#RegPassWord").value;
  let confirmPassword = document.querySelector("#ConfirmPassWord").value;
  if (RegPassword === confirmPassword && RegPassword.length > 5) {
    try {
      let res = await axios.post(
        "http://localhost:1337/api/auth/local/register",
        {
          username: RegUserName,
          email: RegEmail,
          password: RegPassword,
        }
      );
      alert("Kontot har skapats!");
      document.querySelector("#RegUserName").value = "";
      document.querySelector("#RegEmail").value = "";
      document.querySelector("#RegPassWord").value = "";
      document.querySelector("#ConfirmPassWord").value = "";
      showLoginPage();
    } catch (error) {
      console.log(error.code);
      //lite klurigare här då en bad_request innebär att lösenordet inte är 6 siffror eller att namnet redan är taget helt enkelt inte uppfyller strapis krav
      if (error.code === "ERR_BAD_REQUEST") {
        alert(
          "Ojoj! Användarnamn kan vara taget! Testa ett annat! (Är detta en riktig mail? kontrollera att den följer regeln (bokstäver/siffror)@(bokstäver/siffror).com)"
        );
        //annars är de ett annat fel jag inte fått upp genom att testa min application
      } else {
        alert("Unknow Error Check Connection");
      }
    }
  } else {
    alert(
      "Confirmationen är inte samma som lösenordet! kontrollera att lösenordet är minst 6 bokstäver långt!"
    );
  }
};
//regknappen kör funktionen register
let RegBtn = document
  .querySelector("#RegisterBtn")
  .addEventListener("click", Register);

//visar loginpage med display switch
let showLoginPage = () => {
  let loginPage = document.querySelector("#inloggPage");
  let registerPage = document.querySelector("#RegisterPage");
  let homePage = document.querySelector("#Home");

  if (loginPage && registerPage) {
    loginPage.style.display = "block";
    registerPage.style.display = "none";
    homePage.style.display = "none";
  }
};
function calculateAverage(ratings) {
  if (!ratings || ratings.length === 0) {
    return null;
  }
  let totalSum = 0;
  for (let i = 0; i < ratings.length; i++) {
    totalSum += ratings[i].attributes.Betyg;
  }
  let count = ratings.length;
  let average = totalSum / count;
  return average;
}

//visar registerpage med display switch
let showRegisterPage = () => {
  let loginPage = document.querySelector("#inloggPage");
  let registerPage = document.querySelector("#RegisterPage");
  let homePage = document.querySelector("#Home");

  if (loginPage && registerPage) {
    loginPage.style.display = "none";
    homePage.style.display = "none";
    registerPage.style.display = "flex";
  }
};
//knapp som visar regSidan
let createBtn = document
  .querySelector("#CreateBtn")
  .addEventListener("click", showRegisterPage);
//knapp som visar loggaIn sidan
let renderBtn = document
  .querySelector("#RenderBtn")
  .addEventListener("click", showLoginPage);
//visar utloggad startSida
let RenderLogoutState = async () => {
  let loginPage = document.querySelector("#inloggPage");
  let registerPage = document.querySelector("#RegisterPage");
  let homePage = document.querySelector("#Home");
  let bookListContainer = document.querySelector("#bookList");
  let homePag = document.querySelector("#HomeInlogg");

  // Visa homePage och dölj loginPage oavsett om användaren är inloggad eller inte
  homePage.style.display = "block";
  homePag.style.display = "none";
  loginPage.style.display = "none";
  registerPage.style.display = "none";

  try {
    // Hämta böcker från API:et
    let response = await axios.get(
      "http://localhost:1337/api/boks?populate=deep,3"
    );

    let books = response.data.data;

    // Rensa
    bookListContainer.innerHTML = "";

    books.forEach((bok) => {
      let bokDiv = document.createElement("div");
      bokDiv.classList.add("book-container");

      let betygen = bok.attributes.betygs.data;

      let img = document.createElement("img");
      img.src = `http://localhost:1337${bok.attributes.BookCover.data.attributes.url}`;
      bokDiv.append(img);

      let titlePara = document.createElement("p");
      titlePara.innerText = `Title: ${bok.attributes.Titel}`;
      bokDiv.append(titlePara);

      let authorPara = document.createElement("p");
      authorPara.innerText = `Author: ${bok.attributes.Author}`;
      bokDiv.append(authorPara);

      let publishedPara = document.createElement("p");
      publishedPara.innerText = `Published Date: ${bok.attributes.Utgivningdatum}`;
      bokDiv.append(publishedPara);

      let pagesPara = document.createElement("p");
      pagesPara.innerText = `Pages: ${bok.attributes.Pages}`;
      bokDiv.append(pagesPara);

      let averageRating = calculateAverage(betygen);
      if (averageRating !== null) {
        // Lägg till bokens genomsnittliga betyg
        let ratingPara = document.createElement("p");
        ratingPara.innerText = `Average Rating: ${averageRating.toFixed(2)}`;
        bokDiv.appendChild(ratingPara);
      } else {
        // Om inga betyg finns för boken
        let noRatingPara = document.createElement("p");
        noRatingPara.innerText = `No ratings yet`;
        bokDiv.appendChild(noRatingPara);
      }

      bookListContainer.appendChild(bokDiv);
    });
  } catch (error) {
    alert("Kontrollera ditt Nätverk!");
  }
};
RenderLogoutState();
//Visar inLoggad Startsida
let RenderLoginState = async () => {
  let user = JSON.parse(sessionStorage.getItem("user")).username;

  let loginPage = document.querySelector("#inloggPage");
  let homePage = document.querySelector("#HomeInlogg");
  let ProfilePage = document.querySelector("#ProfilePage");
  ProfilePage.style.display = "none";
  homePage.style.display = "flex";
  loginPage.style.display = "none";

  document.querySelector("#user").innerHTML = user;

  let boks = await axios.get(
    "http://localhost:1337/api/boks?populate=deep,3",
    {}
  );

  let Boks = boks.data.data;
  let bookListContainer = document.querySelector("#bookLista");
  bookListContainer.innerHTML = "";
  let bookSelect = document.querySelector("#bookSelect");

  Boks.forEach((bok) => {
    // Skapa en ny div för varje bok
    let bokDiv = document.createElement("div");
    bokDiv.classList.add("book-container");
    let betygen = bok.attributes.betygs.data;

    let option = document.createElement("option");
    option.value = bok.id;
    option.textContent = bok.attributes.Titel;
    bookSelect.append(option);

    let img = document.createElement("img");
    img.src = `http://localhost:1337${bok.attributes.BookCover.data.attributes.url}`;
    img.alt = bok.id;
    bokDiv.append(img);

    let titlePara = document.createElement("p");
    titlePara.innerText = `Title: ${bok.attributes.Titel}`;
    bokDiv.append(titlePara);

    let authorPara = document.createElement("p");
    authorPara.innerText = `Author: ${bok.attributes.Author}`;
    bokDiv.append(authorPara);

    // Skapa en paragraf för bokens publiceringsdatum
    let publishedPara = document.createElement("p");
    publishedPara.innerText = `Published Date: ${bok.attributes.Utgivningdatum}`;
    bokDiv.append(publishedPara);

    // Skapa en paragraf för bokens sidantal
    let pagesPara = document.createElement("p");
    pagesPara.innerText = `Pages: ${bok.attributes.Pages}`;
    bokDiv.append(pagesPara);

    let averageRating = calculateAverage(betygen);
    if (averageRating !== null) {
      // Lägg till bokens genomsnittliga betyg
      let ratingPara = document.createElement("p");
      ratingPara.innerText = `Average Rating: ${averageRating.toFixed(2)}`;
      bokDiv.append(ratingPara);
    } else {
      // Om inga betyg finns för boken
      let noRatingPara = document.createElement("p");
      noRatingPara.innerText = `-`;
      bokDiv.append(noRatingPara);
    }
    let SaveBok = document.createElement("button");
    SaveBok.innerText = "Save";
    SaveBok.style.width = "auto";
    SaveBok.classList.add("saveBtn");
    bokDiv.append(SaveBok);

    // Lägg till bokdiv till bookListContainer
    bookListContainer.appendChild(bokDiv);
  });
  let saveBtn = document.querySelectorAll(".saveBtn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      let imgElement = event.target.parentNode.querySelector("img");
      let bookId = imgElement.alt;

      saveBookToUser(bookId);
    });
  });
};
//knapp som sätter ett betyg
document.querySelector("#submitBtn").addEventListener("click", async () => {
  let bookId = document.querySelector("#bookSelect").value;
  let rating = document.querySelector("#ratingInput").value;
  let loggedInUser = JSON.parse(sessionStorage.getItem("user")).id;
  //om denna är true så kommer vi sätta betyget
  let betygsätta = true;
  //vi gör denna fetch för att kontrollera våran nuvarande data och se om user och bok som är ett och samma betyg matchar
  //med vad vi försöker att skapa så skapar vi den inte utan vi skriver felmeddelande
  try {
    let res = await axios.get(
      "http://localhost:1337/api/betygs?populate=deep,3"
    );
    let Data = res.data.data;
    Data.forEach((betyg) => {
      user = betyg.attributes.user.data.id;
      bok = betyg.attributes.bok.data.id;
      let bokString = String(bok);
      if (user === loggedInUser && bokString === bookId) {
        betygsätta = false;
      }
    });
    //skapa en foreach hitta datan lägg den i en variabel och sedan dubbelkolla
    //så att datan inte finns i de vi försöker pusha in att bokid och user id inte stämmer ihop
  } catch (error) {
    console.log(error);
  }
  if (betygsätta === true) {
    try {
      let response = await axios.post("http://localhost:1337/api/betygs", {
        data: {
          Betyg: rating,
          bok: bookId,
          user: loggedInUser,
        },
      });
      document.querySelector("#ratingInput").value = "";
      document.querySelector("#bookSelect").value = "";
      RenderLoginState();
      alert("Bok betygsatt!");
    } catch (error) {
      console.error(error);
      alert("Ett fel uppstod vid betygsättning av bok.");
    }
  } else {
    alert("Du har redan betygsatt denna bok!");
  }
});
//logout knapp
let logoutBtn = document.querySelector("#logout");
logoutBtn.addEventListener("click", () => {
  RenderLogoutState();

  sessionStorage.clear();
});
//knapp som visar profilsidan
let ProfileBtn = document.querySelector("#Profile");
ProfileBtn.addEventListener("click", () => {
  let homePage = document.querySelector("#HomeInlogg");
  let profilePage = document.querySelector("#ProfilePage");
  homePage.style.display = "none";
  profilePage.style.display = "block";
  RenderProfilepage();
});
//Funktion som renderar profilesidan
let RenderProfilepage = async () => {
  let userId = JSON.parse(sessionStorage.getItem("user")).id;
  let user = JSON.parse(sessionStorage.getItem("user")).username;
  let bookListContainer = document.querySelector("#bokListan");
  let bookListContainern = document.querySelector("#bookListan");
  bookListContainer.innerHTML = "";
  bookListContainern.innerHTML = "";

  try {
    let res = await axios.get(
      `http://localhost:1337/api/users/${userId}?populate=deep,4`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let data = res.data.betygs;

    data.forEach((bok) => {
      let bokDiv = document.createElement("div");
      bokDiv.classList.add("book-container");

      let img = document.createElement("img");
      img.src = `http://localhost:1337${bok.bok.BookCover.formats.thumbnail.url}`;
      bokDiv.append(img);

      let titlePara = document.createElement("p");
      titlePara.innerText = `Title: ${bok.bok.Titel}`;
      bokDiv.append(titlePara);

      let authorPara = document.createElement("p");
      authorPara.innerText = `Author: ${bok.bok.Author}`;
      bokDiv.append(authorPara);

      let publishedPara = document.createElement("p");
      publishedPara.innerText = `Published Date: ${bok.bok.Utgivningdatum}`;
      bokDiv.append(publishedPara);

      let pagesPara = document.createElement("p");
      pagesPara.innerText = `Pages: ${bok.bok.Pages}`;
      bokDiv.append(pagesPara);

      let betygen = bok.Betyg;

      // Lägg till bokens betyg som användaren lagt
      let ratingPara = document.createElement("p");
      ratingPara.innerText = `${user}s Rating: ${betygen}`;
      bokDiv.append(ratingPara);

      bookListContainern.append(bokDiv);
    });

    let Data = res.data.gillats;

    Data.forEach((bok) => {
      let bokDiv = document.createElement("div");
      bokDiv.classList.add("book-container");

      let DeleteBtn = document.createElement("button");
      DeleteBtn.innerText = "X";
      DeleteBtn.classList.add("Delete");
      bokDiv.append(DeleteBtn);

      let img = document.createElement("img");
      img.src = `http://localhost:1337${bok.bok.BookCover.url}`;
      img.alt = bok.id;
      bokDiv.append(img);

      let titlePara = document.createElement("p");
      titlePara.innerText = `Title: ${bok.bok.Titel}`;
      bokDiv.append(titlePara);

      let authorPara = document.createElement("p");
      authorPara.innerText = `Author: ${bok.bok.Author}`;
      bokDiv.append(authorPara);

      let publishedPara = document.createElement("p");
      publishedPara.innerText = `Published Date: ${bok.bok.Utgivningdatum}`;
      bokDiv.append(publishedPara);

      let pagesPara = document.createElement("p");
      pagesPara.innerText = `Pages: ${bok.bok.Pages}`;
      bokDiv.append(pagesPara);

      bookListContainer.append(bokDiv);
    });
  } catch (error) {
    console.log(error);
  }
  let DeleteBtn = document.querySelectorAll(".Delete").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      let imgElement = event.target.parentNode.querySelector("img");
      let bookId = imgElement.alt;

      DeleteBookFromUser(bookId);
    });
  });
};
//funktion som renderar profilsidan när titeln/author är sorterad
let RenderSort = async (sortFunction) => {
  let userId = JSON.parse(sessionStorage.getItem("user")).id;
  let user = JSON.parse(sessionStorage.getItem("user")).username;
  let bookListContainer = document.querySelector("#bokListan");
  let bookListContainern = document.querySelector("#bookListan");
  bookListContainer.innerHTML = "";
  bookListContainern.innerHTML = "";

  try {
    let res = await axios.get(
      `http://localhost:1337/api/users/${userId}?populate=deep,4`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let data = res.data.betygs;

    data.forEach((bok) => {
      let bokDiv = document.createElement("div");
      bokDiv.classList.add("book-container");

      let img = document.createElement("img");
      img.src = `http://localhost:1337${bok.bok.BookCover.formats.thumbnail.url}`;
      bokDiv.append(img);

      let titlePara = document.createElement("p");
      titlePara.innerText = `Title: ${bok.bok.Titel}`;
      bokDiv.append(titlePara);

      let authorPara = document.createElement("p");
      authorPara.innerText = `Author: ${bok.bok.Author}`;
      bokDiv.append(authorPara);

      let publishedPara = document.createElement("p");
      publishedPara.innerText = `Published Date: ${bok.bok.Utgivningdatum}`;
      bokDiv.append(publishedPara);

      let pagesPara = document.createElement("p");
      pagesPara.innerText = `Pages: ${bok.bok.Pages}`;
      bokDiv.append(pagesPara);

      let betygen = bok.Betyg;

      // Lägg till bokens betyg som användaren lagt
      let ratingPara = document.createElement("p");
      ratingPara.innerText = `${user}s Rating: ${betygen}`;
      bokDiv.append(ratingPara);

      bookListContainern.append(bokDiv);
    });

    let Data = res.data.gillats;

    // Använd sorteringsfunktionen
    sortFunction(Data);

    Data.forEach((bok) => {
      let bokDiv = document.createElement("div");
      bokDiv.classList.add("book-container");

      let DeleteBtn = document.createElement("button");
      DeleteBtn.innerText = "X";
      DeleteBtn.classList.add("Delete");
      bokDiv.append(DeleteBtn);

      let img = document.createElement("img");
      img.src = `http://localhost:1337${bok.bok.BookCover.url}`;
      img.alt = bok.id;
      bokDiv.append(img);

      let titlePara = document.createElement("p");
      titlePara.innerText = `Title: ${bok.bok.Titel}`;
      bokDiv.append(titlePara);

      let authorPara = document.createElement("p");
      authorPara.innerText = `Author: ${bok.bok.Author}`;
      bokDiv.append(authorPara);

      let publishedPara = document.createElement("p");
      publishedPara.innerText = `Published Date: ${bok.bok.Utgivningdatum}`;
      bokDiv.append(publishedPara);

      let pagesPara = document.createElement("p");
      pagesPara.innerText = `Pages: ${bok.bok.Pages}`;
      bokDiv.append(pagesPara);

      bookListContainer.append(bokDiv);
    });
  } catch (error) {
    console.log(error);
  }
  let DeleteBtn = document.querySelectorAll(".Delete").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      let imgElement = event.target.parentNode.querySelector("img");
      let bookId = imgElement.alt;

      DeleteBookFromUser(bookId);
    });
  });
};
//funktion som renderar när sort är sorterad
let RenderSortRating = async () => {
  let userId = JSON.parse(sessionStorage.getItem("user")).id;
  let user = JSON.parse(sessionStorage.getItem("user")).username;
  let bookListContainer = document.querySelector("#bokListan");
  let bookListContainern = document.querySelector("#bookListan");
  bookListContainer.innerHTML = "";
  bookListContainern.innerHTML = "";

  try {
    let res = await axios.get(
      `http://localhost:1337/api/users/${userId}?populate=deep,4`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let data = res.data.betygs;

    SortRating(data);

    data.forEach((bok) => {
      let bokDiv = document.createElement("div");
      bokDiv.classList.add("book-container");

      let img = document.createElement("img");
      img.src = `http://localhost:1337${bok.bok.BookCover.formats.thumbnail.url}`;
      bokDiv.append(img);

      let titlePara = document.createElement("p");
      titlePara.innerText = `Title: ${bok.bok.Titel}`;
      bokDiv.append(titlePara);

      let authorPara = document.createElement("p");
      authorPara.innerText = `Author: ${bok.bok.Author}`;
      bokDiv.append(authorPara);

      let publishedPara = document.createElement("p");
      publishedPara.innerText = `Published Date: ${bok.bok.Utgivningdatum}`;
      bokDiv.append(publishedPara);

      let pagesPara = document.createElement("p");
      pagesPara.innerText = `Pages: ${bok.bok.Pages}`;
      bokDiv.append(pagesPara);

      let betygen = bok.Betyg;

      // Lägg till bokens betyg som användaren lagt
      let ratingPara = document.createElement("p");
      ratingPara.innerText = `${user}s Rating: ${betygen}`;
      bokDiv.append(ratingPara);

      bookListContainern.append(bokDiv);
    });

    let Data = res.data.gillats;

    Data.forEach((bok) => {
      let bokDiv = document.createElement("div");
      bokDiv.classList.add("book-container");

      let DeleteBtn = document.createElement("button");
      DeleteBtn.innerText = "X";
      DeleteBtn.classList.add("Delete");
      bokDiv.append(DeleteBtn);

      let img = document.createElement("img");
      img.src = `http://localhost:1337${bok.bok.BookCover.url}`;
      img.alt = bok.id;
      bokDiv.append(img);

      let titlePara = document.createElement("p");
      titlePara.innerText = `Title: ${bok.bok.Titel}`;
      bokDiv.append(titlePara);

      let authorPara = document.createElement("p");
      authorPara.innerText = `Author: ${bok.bok.Author}`;
      bokDiv.append(authorPara);

      let publishedPara = document.createElement("p");
      publishedPara.innerText = `Published Date: ${bok.bok.Utgivningdatum}`;
      bokDiv.append(publishedPara);

      let pagesPara = document.createElement("p");
      pagesPara.innerText = `Pages: ${bok.bok.Pages}`;
      bokDiv.append(pagesPara);

      bookListContainer.append(bokDiv);
    });
  } catch (error) {
    console.log(error);
  }
  let DeleteBtn = document.querySelectorAll(".Delete").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      let imgElement = event.target.parentNode.querySelector("img");
      let bookId = imgElement.alt;

      DeleteBookFromUser(bookId);
    });
  });
};
//funktion som sparar böcker till gillat collection
let saveBookToUser = async (bookId) => {
  let userId = JSON.parse(sessionStorage.getItem("user")).id;

  let AllredySaved = false;
  try {
    let res = await axios.get(
      `http://localhost:1337/api/gillats?populate=deep,3`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let Data = res.data.data;
    Data.forEach((bok) => {
      let bokString = String(bok.attributes.bok.data.id);
      let user = bok.attributes.user.data.id;

      if (bokString === bookId && user === userId) {
        AllredySaved = true;
      }
    });
  } catch (error) {
    console.log(error);
    alert("Kolla ditt nätverk");
  }
  if (AllredySaved === false) {
    try {
      let response = await axios.post(`http://localhost:1337/api/gillats`, {
        data: {
          bok: bookId,
          user: userId,
        },

        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      alert("Boken har sparats!");
    } catch (error) {
      console.error("Fel vid sparande:", error);
      alert("Det gick inte att spara boken");
    }
  } else {
    alert("Du har redan sparat denna bok!");
  }
};
//funktion som tar bort böcker från gillat collection
let DeleteBookFromUser = async (bookId) => {
  try {
    let response = await axios.delete(
      `http://localhost:1337/api/gillats/${bookId}`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    alert("Boken har Raderats");
    RenderProfilepage();
  } catch (error) {
    console.error(error);
    alert("Det gick inte att ta bort boken");
  }
};
//funktion som sorterar titel
let SortTitel = (bookData) => {
  //sorterar på titel
  bookData.sort((a, b) => {
    let titleA = a.bok.Titel.toLowerCase();
    let titleB = b.bok.Titel.toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });
};
//funktion som sorterar på author
let SortWriter = (bookData) => {
  //sorterar på author
  bookData.sort((a, b) => {
    let titleA = a.bok.Author.toLowerCase();
    let titleB = b.bok.Author.toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });
};
//funktion som sorterar på betyg
let SortRating = (bookData) => {
  bookData.sort((a, b) => b.Betyg - a.Betyg);
};
//funktion går tillbaka till inloggadStartSida
let BtnBack = document.querySelector("#ProfileBackBtn");
BtnBack.addEventListener("click", () => {
  RenderLoginState();
});
//knapp som kör sorteringen av titel
document.getElementById("SortTitel").addEventListener("click", () => {
  RenderSort(SortTitel);
});
//knapp som kör sorteringen av author
document.getElementById("SortAuthor").addEventListener("click", () => {
  RenderSort(SortWriter);
});
//knapp som kör sorteringen av betyg
let SortRatingBtn = document
  .querySelector("#SortRating")
  .addEventListener("click", RenderSortRating);
