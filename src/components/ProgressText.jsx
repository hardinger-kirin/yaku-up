export default function ProgressText({ correct, total }) {
  return (
    <p className="progress-text">
      Progress: {correct} / {total}
    </p>
  );
}
