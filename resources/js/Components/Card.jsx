
import React from 'react';

const Card = ({ children, style, className }) => {
    return (
        <div className={`card ${className}`} style={style}>
            {children}
        </div>
    );
};

const CardBody = ({ children, className }) => {
    return <div className={`card-body ${className}`}>{children}</div>;
};

const CardTitle = ({ children, className }) => {
    return <h2 className={`card-title ${className}`}>{children}</h2>;
};

const CardActions = ({ children, className }) => {
    return <div className={`card-actions ${className}`}>{children}</div>;
};

Card.Body = CardBody;
Card.Title = CardTitle;
Card.Actions = CardActions;

export default Card;
