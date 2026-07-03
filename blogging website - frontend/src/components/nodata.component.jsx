const NoData = ({ message }) => {
  return (
    <div className="text-center mt-16 text-dark-grey">
      <p>{message || "Nothing to show here"}</p>
    </div>
  );
};

export default NoData;