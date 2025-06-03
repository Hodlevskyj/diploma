interface CategoryButtonProps {
	category: string | null
	selectedCategory: string | null
	onClick: () => void
	children: React.ReactNode
}

const CategoryButton = ({
	category,
	selectedCategory,
	onClick,
	children,
}: CategoryButtonProps) => {
	return (
		<button
			onClick={onClick}
			className={`px-4 py-2 rounded ${
				selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'
			}`}
		>
			{children}
		</button>
	)
}

export default CategoryButton
