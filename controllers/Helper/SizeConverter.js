exports.getShortSize = (size) => {
    if(size == 'small') return 'S';
    else if(size == 'medium') return 'M';
    if(size == 'large') return 'L';
    if(size == 'extraLarge') return 'XL';
    if(size == 'doubleExtraLarge') return 'XXL';
}