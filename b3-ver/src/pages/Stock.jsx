import { useParams } from "react-router-dom";

function Stock() {
    const { symbol } = useParams();

    return (
        <div>
            <h1>Stock {symbol}</h1>
        </div>
    );
}

export default Stock;