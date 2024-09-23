exports.getSize = (size) => {
    if(size == 'small') return 'Small';
    else if(size == 'medium') return 'Medium';
    if(size == 'large') return 'Large';
    if(size == 'extraLarge') return 'Extra Large';
    if(size == 'doubleExtraLarge') return 'Double Extra Large';
}
exports.getSmallSize = (size) => {
    if(size == 'small') return 'S';
    else if(size == 'medium') return 'M';
    if(size == 'large') return 'L';
    if(size == 'extraLarge') return 'XL';
    if(size == 'doubleExtraLarge') return 'XXL';
}