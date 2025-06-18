import PropTypes from 'prop-types';

function TransactionText({ transaction }) {
    const { name, tax } = transaction;

    return tax ? `${name} (${tax}% tax)` : name;
}

TransactionText.propTypes = {
    transaction: PropTypes.shape({
        name: PropTypes.string,
        tax: PropTypes.number,
    }),
};

export default TransactionText;
