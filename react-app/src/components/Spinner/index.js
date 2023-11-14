
import { BounceLoader } from 'react-spinners';

const Spinner = () => (
  <div className="spinner-container">
    <BounceLoader color="#123abc" loading={true} size={50} />
  </div>
);

export default Spinner;
