'use client'

import {
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type UniqueIdentifier,
} from '@dnd-kit/core'
import { arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
	ColumnDef,
	ColumnFiltersState,
	Row,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { GripVerticalIcon, MoreVerticalIcon } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { deleteUser, updateUserRole } from '@/lib/api'
import { toast } from 'react-toastify'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select'

type Role = 'USER' | 'ADMIN'

export interface User {
	id: number
	email: string
	name: string | null
	role: 'USER' | 'ADMIN'
	createdAt?: string
}

// Визначимо схему для користувачів
export const userSchema = z.object({
	id: z.number(),
	email: z.string(),
	name: z.string().nullable(),
	role: z.enum(['USER', 'ADMIN']),
	createdAt: z.string().optional(),
})

function DragHandle({ id }: { id: number }) {
	const { attributes, listeners } = useSortable({
		id,
	})

	return (
		<Button
			{...attributes}
			{...listeners}
			variant='ghost'
			size='icon'
			className='size-7 text-muted-foreground hover:bg-transparent'
		>
			<GripVerticalIcon className='size-3 text-muted-foreground' />
			<span className='sr-only'>Drag to reorder</span>
		</Button>
	)
}

function DraggableRow({ row }: { row: Row<z.infer<typeof userSchema>> }) {
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: row.original.id,
	})

	return (
		<TableRow
			data-state={row.getIsSelected() && 'selected'}
			data-dragging={isDragging}
			ref={setNodeRef}
			className='relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80'
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}
		>
			{row.getVisibleCells().map(cell => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	)
}

export function DataTable({ users }: { users: User[] }) {
	const [data, setData] = React.useState(() => [...users])
	const [rowSelection, setRowSelection] = React.useState({})
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({})
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	)
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	})
	const [isDeleting, setIsDeleting] = React.useState<number | null>(null)
	const sortableId = React.useId()
	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {})
	)
	const [isUpdatingRole, setIsUpdatingRole] = React.useState<number | null>(
		null
	)

	const handleDeleteUser = async (userId: number) => {
		try {
			setIsDeleting(userId)
			await deleteUser(userId)
			setData(prevData => prevData.filter(user => user.id !== userId))
			toast.success('User deleted successfully')
		} catch (error: any) {
			toast.error(error.message || 'Failed to delete user')
		} finally {
			setIsDeleting(null)
		}
	}

	const handleRoleChange = async (userId: number, newRole: Role) => {
		try {
			setIsUpdatingRole(userId)
			await updateUserRole(userId, newRole)
			setData(prevData =>
				prevData.map(user =>
					user.id === userId ? { ...user, role: newRole } : user
				)
			)
			toast.success('User role updated successfully')
		} catch (error: any) {
			toast.error(error.message || 'Failed to update user role')
		} finally {
			setIsUpdatingRole(null)
		}
	}

	React.useEffect(() => {
		console.log('Users:', users)
		console.log('Data:', data)
	}, [users, data])

	const dataIds = React.useMemo<UniqueIdentifier[]>(
		() => data?.map(({ id }) => id) || [],
		[data]
	)

	const columns: ColumnDef<z.infer<typeof userSchema>>[] = React.useMemo(
		() => [
			{
				id: 'drag',
				header: () => null,
				cell: ({ row }) => <DragHandle id={row.original.id} />,
			},
			{
				id: 'select',
				header: ({ table }) => (
					<div className='flex items-center justify-center'>
						<Checkbox
							checked={
								table.getIsAllPageRowsSelected() ||
								(table.getIsSomePageRowsSelected() && 'indeterminate')
							}
							onCheckedChange={value =>
								table.toggleAllPageRowsSelected(!!value)
							}
							aria-label='Select all'
						/>
					</div>
				),
				cell: ({ row }) => (
					<div className='flex items-center justify-center'>
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={value => row.toggleSelected(!!value)}
							aria-label='Select row'
						/>
					</div>
				),
				enableSorting: false,
				enableHiding: false,
			},
			{
				accessorKey: 'id',
				header: 'ID',
				cell: ({ row }) => row.original.id,
			},
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) =>
					row.original.name || (
						<span className='italic text-gray-400'>No name</span>
					),
			},
			{
				accessorKey: 'email',
				header: 'Email',
				cell: ({ row }) => row.original.email,
			},
			{
				accessorKey: 'role',
				header: 'Role',
				cell: ({ row }) => (
					<Select
						disabled={isUpdatingRole === row.original.id}
						value={row.original.role}
						onValueChange={(value: Role) =>
							handleRoleChange(row.original.id, value)
						}
					>
						<SelectTrigger className='w-24'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='USER'>User</SelectItem>
							<SelectItem value='ADMIN'>Admin</SelectItem>
						</SelectContent>
					</Select>
				),
			},
			{
				accessorKey: 'createdAt',
				header: 'Created At',
				cell: ({ row }) =>
					row.original.createdAt || (
						<span className='italic text-gray-400'>N/A</span>
					),
			},
			{
				id: 'actions',
				cell: ({ row }) => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								className='flex size-8 text-muted-foreground data-[state=open]:bg-muted'
								size='icon'
								disabled={isDeleting === row.original.id}
							>
								<MoreVerticalIcon />
								<span className='sr-only'>Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-32'>
							<DropdownMenuItem
								className='text-red-600 focus:text-red-600'
								disabled={isDeleting === row.original.id}
								onClick={() => handleDeleteUser(row.original.id)}
							>
								{isDeleting === row.original.id ? 'Deleting...' : 'Delete'}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
		[isUpdatingRole]
	)

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: row => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	})

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event
		if (active && over && active.id !== over.id) {
			setData(data => {
				const oldIndex = dataIds.indexOf(active.id)
				const newIndex = dataIds.indexOf(over.id)
				return arrayMove(data, oldIndex, newIndex)
			})
		}
	}

	return (
		<Tabs
			defaultValue='outline'
			className='flex w-full flex-col justify-start gap-6'
		>
			<TabsContent
				value='outline'
				className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'
			>
				<div className='overflow-hidden rounded-lg border'>
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map(headerGroup => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map(header => (
										<TableHead
											key={header.id}
											colSpan={header.colSpan}
											className='px-4 py-2 border'
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map(row => <DraggableRow key={row.id} row={row} />)
							) : (
								<TableRow>
									<TableCell
										colSpan={table.getAllColumns().length}
										className='h-24 text-center px-4 py-2 border'
									>
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</TabsContent>
		</Tabs>
	)
}
