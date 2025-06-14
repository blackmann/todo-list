import React from "react";

interface FileInputProps extends React.ComponentProps<"input"> {
	children: React.ReactNode;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
	({ children, ...props }, ref) => {
		return (
			<label className="flex items-center gap-1 bg-transparent cursor-pointer">
				<div className="flex items-center gap-1">{children}</div>
				<input type="file" className="hidden" {...props} ref={ref} />
			</label>
		);
	},
);

FileInput.displayName = "FileInput";

export { FileInput };
