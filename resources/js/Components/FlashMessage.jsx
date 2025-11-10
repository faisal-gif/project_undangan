import React from 'react';

export default function FlashMessage({ flash }) {
    return (
        <div>
            {flash.success && (
                <div className="toast toast-top toast-end">
                    <div className="alert alert-success">
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash.error && (
                <div className="toast">
                    <div className="toast toast-top toast-end">
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}
        </div>
    );
}