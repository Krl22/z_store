import { ReactNode, useEffect, useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { db } from "../lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const check = async () => {
      if (loading) return
      if (!user || !user.email) {
        setIsAdmin(false)
        setChecking(false)
        navigate("/", { replace: true })
        return
      }
      const ref = doc(db, "admins", user.email.toLowerCase())
      const snap = await getDoc(ref)
      setIsAdmin(snap.exists())
      setChecking(false)
      if (!snap.exists()) navigate("/", { replace: true })
    }
    check()
  }, [user, loading, navigate])

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 w-full max-w-md space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-32" />
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
          <p className="text-sm text-muted-foreground mb-4">Esta sección está disponible solo para administradores.</p>
          <Button onClick={() => navigate("/home")}>Volver al inicio</Button>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

