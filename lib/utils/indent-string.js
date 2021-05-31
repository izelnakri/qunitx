export default function indentString(string, count = 1, options = {}) {
	const { indent = ' ', includeEmptyLines = false } = options;

	if (count <= 0) {
		return string;
	}

	const regex = includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;

	return string.replace(regex, indent.repeat(count));
}
