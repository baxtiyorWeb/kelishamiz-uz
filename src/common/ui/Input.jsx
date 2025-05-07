import {forwardRef} from "react";

export const Input = forwardRef((props, ref) => {
    // eslint-disable-next-line react/prop-types
    const {className = "", ...rest} = props;

    return (<input
        ref={ref}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...rest}
    />);
});

Input.displayName = "Input";
