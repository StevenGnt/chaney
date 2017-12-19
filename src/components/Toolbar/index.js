import React from 'react';

class Toolbar extends React.Component {
    render() {
        return <div id="toolbar">
            <span className="filler"></span>
            <button type="button" className="btn btn-small btn-info">
                <span className="glyphicon glyphicon-tasks"></span>
            </button>
        </div>;
    }
}

export default Toolbar;