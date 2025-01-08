const addToFront = ( array, newItem ) => {
    // Add to front of array
    array.unshift( newItem )
    if( array.length > 5 ) array.pop();

    return array
}

const addToBack = ( array, newItem ) => {
    // Add to front of array
    array.push( newItem );
    if( array.length > 5 ) array.shift();

    return array;
}

const calculatePercentage = ( percentage, totalGames, currentResult ) => {
    const currentStatTotal = percentage * totalGames;
    const newTotal = currentStatTotal + currentResult;
    const newPercentage = newTotal / ( totalGames + 1 );

    return newPercentage;
}

module.exports = { addToFront, addToBack, calculatePercentage };