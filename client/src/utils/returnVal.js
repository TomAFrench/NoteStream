export const returnVal = val => {
    let name;
    switch (val) {
      case "1":
        name = "rock";
        break;
      case "2":
        name = "paper";
        break;
      case "3":
        name = "scissors";
        break;
      case "4":
        name = "lizard";
        break;
      case "5":
        name = "spock";
        break;
    }
    return name;
  };