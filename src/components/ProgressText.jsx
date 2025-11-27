/*
  Handles progress text display showing number of correct cards out of total.
*/

export default function ProgressText({ correct, total }) {
  return (
    <p className="progress-text">
      Progress: {correct} / {total}
    </p>
  );
}
