module.exports.getDate = function (){
    const today = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      
      return today.toLocaleDateString("en-US", options); //formatted date string
}

module.exports.getDay = function (){
    const today = new Date();

    const options = {
        weekday: "long",
      };
      
      return  today.toLocaleDateString("en-US", options); //formatted date string
      
}


