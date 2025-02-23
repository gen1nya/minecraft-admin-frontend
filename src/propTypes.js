import PropTypes from "prop-types";

export const playerPropType = PropTypes.shape({
    name: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    isOp: PropTypes.bool.isRequired,
    isOnline: PropTypes.bool.isRequired,
    gameMode: PropTypes.string.isRequired,
});

export const tokenPropType = PropTypes.string.isRequired;

export const handlerPropType = PropTypes.func.isRequired;
