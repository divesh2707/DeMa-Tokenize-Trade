const ContentPlaceholder = () => {
  const skeletonStyle = (height, width) => ({
    height: `${height}px`,
    width: width,
    backgroundColor: "#555555",
    borderRadius: "4px",
    animation: "pulse 1.5s infinite ease-in-out"
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      {[...Array(4)].map((_, sectionIndex) => (
        <div key={sectionIndex} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={skeletonStyle(30, "80%")} />
          <div style={skeletonStyle(20, "60%")} />
          {sectionIndex >= 2 && <div style={skeletonStyle(15, "40%")} />}
          {sectionIndex >= 3 && <div style={skeletonStyle(15, "20%")} />}
        </div>
      ))}
    </div>
  );
};

export default ContentPlaceholder;
