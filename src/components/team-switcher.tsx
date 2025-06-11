// 'use client'

// import { ChevronDown, Plus } from 'lucide-react'
// import * as React from 'react'

// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuLabel,
// 	DropdownMenuSeparator,
// 	DropdownMenuShortcut,
// 	DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import {
// 	SidebarMenu,
// 	SidebarMenuButton,
// 	SidebarMenuItem,
// } from '@/components/ui/sidebar'

// export function TeamSwitcher({
// 	teams,
// }: {
// 	teams: {
// 		name: string
// 		logo: React.ElementType
// 		plan: string
// 	}[]
// 	user: {
// 		name: string
// 		email: string
// 		avatar: string
// 	} | null
// }) {
// 	const [activeTeam, setActiveTeam] = React.useState(teams[0])

// 	if (!activeTeam) {
// 		return null
// 	}

// 	return (
// 		<SidebarMenu>
// 			<SidebarMenuItem>
// 				<DropdownMenu>
// 					<DropdownMenuTrigger asChild>
// 						<SidebarMenuButton className='w-fit px-1.5'>
// 							<div className='flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground'>
// 								<activeTeam.logo className='size-3' />
// 							</div>
// 							<span className='truncate font-semibold'>{activeTeam.name}</span>
// 							<ChevronDown className='opacity-50' />
// 						</SidebarMenuButton>
// 					</DropdownMenuTrigger>
// 					<DropdownMenuContent
// 						className='w-64 rounded-lg'
// 						align='start'
// 						side='bottom'
// 						sideOffset={4}
// 					>
// 						<DropdownMenuLabel className='text-xs text-muted-foreground'>
// 							Teams
// 						</DropdownMenuLabel>
// 						{teams.map((team, index) => (
// 							<DropdownMenuItem
// 								key={team.name}
// 								onClick={() => setActiveTeam(team)}
// 								className='gap-2 p-2'
// 							>
// 								<div className='flex size-6 items-center justify-center rounded-sm border'>
// 									<team.logo className='size-4 shrink-0' />
// 								</div>
// 								{team.name}
// 								<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
// 							</DropdownMenuItem>
// 						))}
// 						<DropdownMenuSeparator />
// 						<DropdownMenuItem className='gap-2 p-2'>
// 							<div className='flex size-6 items-center justify-center rounded-md border bg-background'>
// 								<Plus className='size-4' />
// 							</div>
// 							<div className='font-medium text-muted-foreground'>Add team</div>
// 						</DropdownMenuItem>
// 					</DropdownMenuContent>
// 				</DropdownMenu>
// 			</SidebarMenuItem>
// 		</SidebarMenu>
// 	)
// }

import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface TeamSwitcherProps {
	teams: {
		name: string
		logo: React.ElementType
		plan: string
	}[]
	user?: {
		name: string
		email: string
		avatar: string
	} | null
}

export function TeamSwitcher({ teams, user }: TeamSwitcherProps) {
	const [open, setOpen] = React.useState(false)
	const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false)
	const [selectedTeam, setSelectedTeam] = React.useState(teams[0])

	return (
		<Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						aria-label='Select a team'
						className='h-16 w-full justify-between border-0 border-b border-sidebar-border rounded-none'
					>
						{user ? (
							<div className='flex items-center gap-2'>
								<Avatar className='h-6 w-6'>
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<div className='flex flex-col items-start text-xs'>
									<span className='font-medium'>{user.name}</span>
									<span className='text-muted-foreground'>{user.email}</span>
								</div>
							</div>
						) : (
							<div className='flex items-center gap-2'>
								<Avatar className='h-6 w-6'>
									<AvatarFallback>
										{React.createElement(selectedTeam.logo, {
											className: 'h-4 w-4',
										})}
									</AvatarFallback>
								</Avatar>
								<span>{selectedTeam.name}</span>
								<span className='ml-auto text-xs text-muted-foreground'>
									{selectedTeam.plan}
								</span>
							</div>
						)}
						<ChevronsUpDown className='ml-auto h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0'>
					<Command>
						<CommandList>
							<CommandInput placeholder='Search team...' />
							<CommandEmpty>No team found.</CommandEmpty>
							{user && (
								<CommandGroup heading='Профіль'>
									<CommandItem className='text-sm'>
										<Link href='/profile' className='flex items-center w-full'>
											<Avatar className='mr-2 h-5 w-5'>
												<AvatarImage src={user.avatar} alt={user.name} />
												<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<span>Мій профіль</span>
										</Link>
									</CommandItem>
									<CommandItem className='text-sm'>
										<Link href='/settings' className='flex items-center w-full'>
											<span>Налаштування</span>
										</Link>
									</CommandItem>
									<CommandItem className='text-sm'>
										<Link href='/logout' className='flex items-center w-full'>
											<span>Вийти</span>
										</Link>
									</CommandItem>
								</CommandGroup>
							)}
							<CommandGroup heading='Teams'>
								{teams.map(team => (
									<CommandItem
										key={team.name}
										onSelect={() => {
											setSelectedTeam(team)
											setOpen(false)
										}}
										className='text-sm'
									>
										<Avatar className='mr-2 h-5 w-5'>
											<AvatarFallback>
												{React.createElement(team.logo, {
													className: 'h-4 w-4',
												})}
											</AvatarFallback>
										</Avatar>
										<span>{team.name}</span>
										<span className='ml-auto text-xs text-muted-foreground'>
											{team.plan}
										</span>
										{selectedTeam.name === team.name && (
											<Check className='ml-2 h-4 w-4' />
										)}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
						<CommandSeparator />
						<CommandList>
							<CommandGroup>
								<DialogTrigger asChild>
									<CommandItem
										onSelect={() => {
											setOpen(false)
											setShowNewTeamDialog(true)
										}}
									>
										<PlusCircle className='mr-2 h-5 w-5' />
										Create Team
									</CommandItem>
								</DialogTrigger>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create team</DialogTitle>
					<DialogDescription>
						Add a new team to manage products and customers.
					</DialogDescription>
				</DialogHeader>
				<div>
					<div className='space-y-4 py-2 pb-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Team name</Label>
							<Input id='name' placeholder='Acme Inc.' />
						</div>
						<div className='space-y-2'>
							<Label htmlFor='plan'>Subscription plan</Label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder='Select a plan' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='free'>
										<span className='font-medium'>Free</span> -{' '}
										<span className='text-muted-foreground'>
											Trial for two weeks
										</span>
									</SelectItem>
									<SelectItem value='pro'>
										<span className='font-medium'>Pro</span> -{' '}
										<span className='text-muted-foreground'>
											$9/month per user
										</span>
									</SelectItem>
									<SelectItem value='enterprise'>
										<span className='font-medium'>Enterprise</span> -{' '}
										<span className='text-muted-foreground'>
											$19/month per user
										</span>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setShowNewTeamDialog(false)}>
						Cancel
					</Button>
					<Button type='submit'>Continue</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
