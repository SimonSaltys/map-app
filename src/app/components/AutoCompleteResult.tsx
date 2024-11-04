import "@/app/tailwind.css";

export function AutoCompleteResult(props: { searchedValue: string }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center justify-center w-96 h-64 bg-blue-500 p-4 text-white text-2xl rounded-lg">
        <p> {props.searchedValue ? props.searchedValue : "No Selection"} </p>
      </div>
    </div>
  );
}
