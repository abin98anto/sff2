import { AlertCircle } from "lucide-react";

interface PlaceholderProps {
  message: string;
}

export default function Placeholder({ message }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
      <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-600">{message}</p>
    </div>
  );
}
