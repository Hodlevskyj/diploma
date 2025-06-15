// "use client"

// import { type LucideIcon } from "lucide-react"

// import {
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"

// export function NavMain({
//   items,
// }: {
//   items: {
//     title: string
//     url: string
//     icon: LucideIcon
//     isActive?: boolean
//   }[]
// }) {
//   return (
//     <SidebarMenu>
//       {items.map((item) => (
//         <SidebarMenuItem key={item.title}>
//           <SidebarMenuButton asChild isActive={item.isActive}>
//             <a href={item.url}>
//               <item.icon />
//               <span>{item.title}</span>
//             </a>
//           </SidebarMenuButton>
//         </SidebarMenuItem>
//       ))}
//     </SidebarMenu>
//   )
// }

'use client'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'

export function NavMain({
	items,
}: {
	items: {
		title: string
		url: string
		icon: LucideIcon
		isActive?: boolean
	}[]
}) {
	return (
		<SidebarMenu>
			{items.map(item => (
				<SidebarMenuItem key={item.title}>
					<SidebarMenuButton asChild isActive={item.isActive}>
						<Link href={item.url}>
							<item.icon />
							<span>{item.title}</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	)
}
